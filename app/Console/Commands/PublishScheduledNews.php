<?php

namespace App\Console\Commands;

use App\Models\News;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('news:publish-scheduled')]
#[Description('Auto-publish berita scheduled yang sudah melewati jadwal tayangnya')]
class PublishScheduledNews extends Command
{
    public function handle()
    {
        $count = News::where('status', 'scheduled')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->update(['status' => 'published']);

        $this->info("✅ {$count} berita berhasil di-publish.");

        return Command::SUCCESS;
    }
}