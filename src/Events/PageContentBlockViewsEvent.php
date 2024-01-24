<?php

namespace Creode\NovaPageBuilder\Events;

use Illuminate\Foundation\Events\Dispatchable;

class PageContentBlockViewsEvent
{
    use Dispatchable;

    /**
     * Lists of views available.
     *
     * @var array
     */
    public $views = [];
}
