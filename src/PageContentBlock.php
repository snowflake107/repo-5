<?php

namespace Creode\NovaPageBuilder;

class PageContentBlock
{
    /**
     * String representation of the view to use.
     *
     * @var string
     */
    protected $view = '';

    /**
     * Array of attributes to pass to the view.
     *
     * @var array
     */
    protected $attributes = [];

    /**
     * Constructor for class.
     *
     * @param string $view
     * @param array $attributes
     */
    public function __construct(string $view, array $attributes)
    {
        $this->view = $view;
        $this->attributes = $attributes;
    }

    /**
     * Get the view.
     *
     * @return void
     */
    public function view()
    {
        return $this->view;
    }

    /**
     * Get the Attributes
     */
    public function attributes()
    {
        return $this->attributes;
    }
}
