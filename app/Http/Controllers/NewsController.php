<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\House;      
use App\Models\Notification;
use App\Models\User;
use App\Notifications\NewsPublishedNotification;
use App\Services\NotificationPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Mews\Purifier\Facades\Purifier;

class NewsController extends Controller
{
    private function getRoleRoutePrefix(): string
    {
        $user = auth()->user();
        return match (true) {
            $user?->isSekretaris() => 'sekretaris',
            $user?->isBendahara()  => 'bendahara',
            $user?->isKetuaRt()    => 'ketuart',
            default                => 'warga',
        };
    }

    private function applyAccessFilter($query)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isSekretaris() || $user->isBendahara() || $user->isKetuaRt());

        if (!$isStaff) {
            $query->published(); 
        }
        return $query;
    }

   public function index()
    {
        $this->authorize('viewAny', News::class);
        $user = auth()->user();

        $query = News::with('author:id,name')->latest('id');
        $this->applyAccessFilter($query);

        $news = $query->paginate(10)->through(fn($item) => [
            'id'         => $item->id,
            'title'      => $item->title,
            'category'   => $item->category ?? 'Informasi',
            'excerpt'    => strip_tags($item->excerpt),
            'image'      => $item->thumbnail ? Storage::url($item->thumbnail) : null,
            'author'     => $item->author?->name ?? 'Admin',
            'status'     => $item->status,
            'date'       => $item->published_at?->format('d M Y') ?? $item->created_at->format('d M Y'),
            'can_edit'   => $user?->can('update', $item) ?? false,
            'can_delete' => $user?->can('delete', $item) ?? false,
        ]);

        $popularTags = News::select('category')
            ->whereNotNull('category')
            ->selectRaw('count(*) as total')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->pluck('category');

        $upcomingAgendas = collect();
        $view = match(true) {
            $user?->isSekretaris() => 'Sekretaris/News/Index',
            $user?->isBendahara()  => 'Bendahara/News/Index',
            $user?->isKetuaRt()    => 'Ketuart/News/Index',
            default                => 'Warga/News/Index',
        };

        if ($view === 'Warga/News/Index' && $user) {
            $today = \Carbon\Carbon::today()->format('Y-m-d');

            $events = News::published()
                ->where(function($q) {
                    $q->where('category', 'Event')
                      ->orWhereNotNull('event_date');
                })
                ->get()
                ->map(fn($item) => [
                    'title' => $item->title,
                    'date' => $item->event_date ?? $item->created_at->format('Y-m-d'),
                    'location' => $item->event_location ?? 'Balai Warga',
                ]);
            
            $personal = \App\Models\Kalender::where('user_id', $user->id)
                ->where('date', '>=', $today)
                ->get()
                ->map(fn($item) => [
                    'title' => $item->title,
                    'date' => $item->date,
                    'location' => $item->location ?? 'Rumah Warga',
                ]);

            $upcomingAgendas = $events->concat($personal)
                ->filter(fn($item) => $item['date'] >= $today)
                ->sortBy('date')
                ->take(3)
                ->values();
        }

        return Inertia::render($view, [
            'articles'        => $news,
            'upcomingAgendas' => $upcomingAgendas,
            'popularTags'     => $popularTags,
            'can'             => ['create' => $user?->can('create', News::class) ?? false],
        ]);
    }

    public function create()
    {
        $this->authorize('create', News::class);
        $viewPath = auth()->user()->isBendahara() ? 'Bendahara/News/Create' : 'Sekretaris/News/Create';
        return Inertia::render($viewPath);
    }

    public function store(Request $request)
    {
        $this->authorize('create', News::class);
        $user = auth()->user();

        if ($user->isBendahara()) {
            $request->merge(['category' => 'Keuangan']);
        }
        
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'category'       => 'nullable|string|max:100',
            'excerpt'        => 'nullable|string|max:255',
            'content'        => 'required|string',
            'image'          => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'thumbnail'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'publish_type'   => 'required|in:now,schedule',
            'published_at'   => 'exclude_unless:publish_type,schedule|required|date|after:now',
            'is_event'       => 'nullable|boolean',
            'event_date'     => 'required_if:is_event,true|nullable|date',
            'event_time'     => 'nullable|string',
            'event_location' => 'required_if:is_event,true|nullable|string|max:255',
        ]);

        $validated['content'] = Purifier::clean($validated['content']);
        
        $uploadedFile = $request->file('image') ?? $request->file('thumbnail');
        if ($uploadedFile) {
            $validated['thumbnail'] = $uploadedFile->store('news', 'public');
        }

        $news = News::create([
            'title'          => $validated['title'],
            'category'       => $validated['category'] ?? 'Keuangan',
            'content'        => $validated['content'],
            'thumbnail'      => $validated['thumbnail'] ?? null,
            'slug'           => Str::slug($validated['title']),
            'excerpt'        => $validated['excerpt'] ?? Str::limit(strip_tags($validated['content']), 150),
            'user_id'        => $user->id,
            'status'         => $request->publish_type === 'schedule' ? 'scheduled' : 'published',
            'published_at'   => $request->publish_type === 'schedule' ? $request->published_at : now(),
            'event_date'     => $request->is_event ? $request->event_date : null,
            'event_time'     => $request->is_event ? $request->event_time : null,
            'event_location' => $request->is_event ? $request->event_location : null,
        ]);

        if ($news->status === 'published') {
            Notification::create([
                'house_id'      => null,
                'recipient_role'=> null,
                'notifiable_id' => $news->id,
                'category'      => 'berita',
                'title'         => 'Pengumuman RT Terbaru',
                'message'       => 'Ada informasi baru: "' . $news->title . '".',
                'actions'       => [
                    [
                        'label' => 'Baca Berita',
                        'type'  => 'primary',
                        'url'   => '#' 
                    ]
                ],
            ]);

            User::where('role', User::ROLE_WARGA)
                ->chunk(100, function ($wargaUsers) use ($news) {
                    foreach ($wargaUsers as $wargaUser) {
                        if (NotificationPreferenceService::canSend($wargaUser, 'berita')) {
                            $wargaUser->notify(new NewsPublishedNotification($news));
                        }
                    }
                });
        }

        return redirect()->route($this->getRoleRoutePrefix() . '.news.index')
                         ->with('success', 'Berita berhasil disimpan.');
    }

    public function show(News $news)
    {
        $this->authorize('view', $news);
        $news->load('author:id,name');

        $formattedNews = [
            'id'           => $news->id,
            'title'        => $news->title,
            'category'     => $news->category ?? 'Announcement',
            'main_content' => $news->content,
            'image'        => $news->thumbnail ? Storage::url($news->thumbnail) : null,
            'author'       => $news->author?->name ?? 'Admin',
            'status'       => $news->status,
            'date'         => $news->published_at?->format('d M Y') ?? $news->created_at->format('d M Y'),
            'featured_tag' => $news->category === 'Keuangan' ? '#LaporanKeuangan' : '#InfoWarga',
        ];

        $recentArticles = News::published()
            ->where('id', '!=', $news->id)
            ->latest()
            ->take(3)
            ->get()
            ->map(fn($item) => [
                'id'    => $item->id,
                'title' => $item->title,
                'image' => $item->thumbnail ? Storage::url($item->thumbnail) : null,
                'date'  => $item->created_at->format('d M Y'),
            ]);

        $user = auth()->user();
        $viewPath = match(true) {
            $user?->isSekretaris() => 'Sekretaris/News/Show',
            $user?->isBendahara()  => 'Bendahara/News/Show',
            $user?->isKetuaRt()    => 'Ketuart/News/Show',
            default                => 'Warga/News/Show',
        };

        return Inertia::render($viewPath, [
            'news'           => $formattedNews,
            'recentArticles' => $recentArticles
        ]);
    }

    public function edit(News $news)
    {
        $this->authorize('update', $news);
        $user = auth()->user();

        $role = match(true) {
            $user->isBendahara() => 'Bendahara',
            default              => 'Sekretaris',
        };
        $viewPath = "{$role}/News/Edit";

        return Inertia::render($viewPath, [
            'news' => [
                'id'           => $news->id,
                'title'        => $news->title,
                'category'     => $news->category,
                'excerpt'      => $news->excerpt,
                'main_content' => $news->content,
                'image'        => $news->thumbnail ? Storage::url($news->thumbnail) : null,
                'publish_type' => $news->status === 'scheduled' ? 'schedule' : 'now',
                'published_at' => $news->published_at ? $news->published_at->format('Y-m-d\TH:i') : '',
            ]
        ]);
    }

    public function update(Request $request, News $news)
    {
        $this->authorize('update', $news);

        if (auth()->user()->isBendahara()) {
            $request->merge(['category' => 'Keuangan']);
        }

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'category'     => 'nullable|string|max:100',
            'excerpt'      => 'nullable|string|max:255',
            'content'      => 'required|string',
            'image'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'thumbnail'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'publish_type' => 'required|in:now,schedule',
            'published_at' => 'exclude_unless:publish_type,schedule|required|date|after:now',
        ]);

        $thumbnailPath = $news->thumbnail;
        $newImage = $request->file('image') ?? $request->file('thumbnail');

        if ($newImage) {
            if ($news->thumbnail) Storage::disk('public')->delete($news->thumbnail);
            $thumbnailPath = $newImage->store('news', 'public');
        }

        $status = ($request->publish_type === 'schedule') ? 'scheduled' : 'published';
        $publishedAt = ($request->publish_type === 'schedule') ? $request->published_at : now();

        $news->update([
            'title'        => $validated['title'],
            'slug'         => Str::slug($validated['title']),
            'category'     => $validated['category'] ?? $news->category,
            'excerpt'      => $validated['excerpt'] ?? Str::limit(strip_tags($validated['content']), 150),
            'content'      => Purifier::clean($validated['content']),
            'thumbnail'    => $thumbnailPath,
            'status'       => $status,
            'published_at' => $publishedAt
        ]);

        return redirect()
            ->route($this->getRoleRoutePrefix() . '.news.index')
            ->with('success', 'Berita berhasil diperbarui.');
    }

    public function destroy(News $news)
    {
        $this->authorize('delete', $news);
        if ($news->thumbnail) {
            Storage::disk('public')->delete($news->thumbnail);
        }
        $news->delete();

        return redirect()
            ->route($this->getRoleRoutePrefix() . '.news.index')
            ->with('success', 'Berita berhasil dihapus.');
    }

    public function all(Request $request)
    {
        $this->authorize('viewAny', News::class);
        $user = auth()->user();

        $query = News::with('author:id,name')->latest('id');
        $this->applyAccessFilter($query);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('excerpt', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $news = $query->paginate(12)->withQueryString()->through(function ($item) use ($user) {
            return [
                'id'         => $item->id,
                'title'      => $item->title,
                'category'   => $item->category ?? 'Informasi',
                'excerpt'    => strip_tags($item->excerpt),
                'image'      => $item->thumbnail ? Storage::url($item->thumbnail) : null,
                'author'     => $item->author?->name ?? 'Admin',
                'status'     => $item->status,
                'date'       => $item->published_at?->format('d M Y') ?? $item->created_at->format('d M Y'),
                'can_edit'   => $user->can('update', $item),
                'can_delete' => $user->can('delete', $item),
            ];
        });

        return Inertia::render('Warga/News/Allnews', [
            'articles' => $news,
            'filters'  => $request->only(['search', 'category']),
        ]);
    }

    public function manage(Request $request)
    {
        $user = auth()->user();

        $query = News::with('author:id,name')->latest('id');

        $roleFolder = match(true) {
            $user->isBendahara()  => 'Bendahara',
            $user->isSekretaris() => 'Sekretaris',
            default               => 'Warga',
        };

        if ($user->isBendahara()) {
            $query->where('category', 'Keuangan');
        } elseif ($user->isSekretaris()) {
            $query->where('category', '!=', 'Keuangan');
        }

        $articles = $query->paginate(10)->through(fn($item) => [
            'id'       => $item->id,
            'title'    => $item->title,
            'excerpt'  => $item->excerpt ?? Str::limit(strip_tags($item->content), 80),
            'image'    => $item->thumbnail ? Storage::url($item->thumbnail) : null,
            'author'   => $item->author?->name ?? 'Admin',
            'date'     => $item->published_at?->format('d M Y') ?? $item->created_at->format('d M Y'),
            'status'   => $item->status,
            'can_edit'   => $user->can('update', $item),
            'can_delete' => $user->can('delete', $item),
        ]);

        return Inertia::render("{$roleFolder}/News/Manage", [
            'articles' => $articles,
            'can'      => ['create' => $user->can('create', News::class)],
        ]);
    }
}