<?php

namespace Creode\NovaPageBuilder\Events;

use Illuminate\Foundation\Events\Dispatchable;

class PageContentBlockAttributesEvent
{
    use Dispatchable;

    /**
     * Constructor for class.
     *
     * @param string $name
     * @param array $attributes
     */
    public function __construct(protected string $name, public array $attributes)
    {
    }

    /**
     * Returns the name of the component.
     *
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }
}
