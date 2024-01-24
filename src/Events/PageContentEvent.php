<?php

namespace Creode\NovaPageBuilder\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Whitecube\NovaFlexibleContent\Flexible as FlexibleField;

class PageContentEvent
{
    use Dispatchable;

    /**
     * Content of the page
     *
     * @var FlexibleField
     */
    public $content = null;

    /**
     * Constructor for class.
     *
     * @param FlexibleField $content
     */
    public function __construct(FlexibleField $content)
    {
        $this->content = $content;
    }
}
