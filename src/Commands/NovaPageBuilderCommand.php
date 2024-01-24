<?php

namespace Creode\NovaPageBuilder\Commands;

use Illuminate\Console\Command;

class NovaPageBuilderCommand extends Command
{
    public $signature = 'nova-page-builder';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
