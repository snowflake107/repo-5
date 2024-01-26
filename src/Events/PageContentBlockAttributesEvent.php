<?php

namespace Creode\NovaPageBuilder\Events;

use Illuminate\Foundation\Events\Dispatchable;

class PageContentBlockAttributesEvent
{
    use Dispatchable;

    /**
     * Constructor for class.
     *
     * @param string $view
     * @param array $attributes
     */
    public function __construct(protected string $view, public array $attributes)
    {
    }

    /**
     * Returns the view.
     *
     * @return string
     */
    public function getView(): string
    {
        return $this->view;
    }
}
