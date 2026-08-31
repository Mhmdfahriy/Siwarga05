<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\News;
use App\Models\Due;
use App\Models\Kalender;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CalendarController extends Controller
{
    public function getCalendarData(Request $request)
    {
        try {
            $user = auth()->user();

            // 1. Ambil Kegiatan RT dari tabel 'news'
            $events = News::where('category', 'Event')
                ->orWhereNotNull('event_date')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => 'news-' . $item->id,
                        'title' => $item->title,
                        'date' => $item->event_date ?? $item->created_at->format('Y-m-d'),
                        'category' => $item->category ?? 'Event',
                        'type' => 'event',
                        'description' => $item->excerpt ?? $item->content ?? '',
                    ];
                });

            // 2. Ambil Tagihan (Pastikan user punya house_id)
            $bills = collect();
            if ($user && $user->house_id) {
                $bills = Due::where('house_id', $user->house_id)
                    ->get()
                    ->map(function ($due) {
                        $dueDate = $due->due_date 
                            ?? (isset($due->period_year, $due->period_month) 
                                ? Carbon::parse("{$due->period_year}-{$due->period_month}-01")->endOfMonth()->format('Y-m-d') 
                                : $due->created_at->addDays(7)->format('Y-m-d'));
                        
                        return [
                            'id' => 'due-' . $due->id,
                            'title' => 'Tagihan: ' . ($due->title ?? $due->name ?? 'Iuran Warga'),
                            'date' => $dueDate,
                            'category' => 'Keuangan',
                            'type' => 'bill',
                            'amount' => $due->amount ?? 0,
                            'status' => $due->status ?? 'unpaid', 
                            'description' => $due->description ?? 'Tagihan iuran / insidental warga.',
                        ];
                    });
            }

            // 3. Ambil Agenda Pribadi Warga
            $personal = collect();
            if ($user) {
                $personal = Kalender::where('user_id', $user->id)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => 'personal-' . $item->id,
                            'title' => $item->title,
                            'date' => $item->date,
                            'category' => $item->category ?? 'Sosial',
                            'type' => 'personal',
                            'time' => $item->time,
                            'location' => $item->location,
                            'description' => $item->description,
                        ];
                    });
            }

            // Gabungkan semua data
            $combined = $events->concat($bills)->concat($personal);

            return response()->json($combined);

        } catch (\Exception $e) {
            Log::error('Error Calendar Data: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storePersonalAgenda(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'nullable',
            'location' => 'nullable|string|max:255',
            'category' => 'required|string',
            'description' => 'nullable|string',
        ]);

        Kalender::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'date' => $request->date,
            'time' => $request->time,
            'location' => $request->location,
            'category' => $request->category,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Agenda pribadi berhasil ditambahkan.');
    }
}