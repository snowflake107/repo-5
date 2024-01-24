<?php

namespace Creode\NovaPageBuilder\Nova\Fields;

use Whitecube\NovaFlexibleContent\Flexible;
use Creode\NovaPageBuilder\Events\PageContentEvent;

class PageBuilder extends Flexible
{
    /**
     * {@inheritdoc}
     */
    public function __construct($name, $attribute = null, $resolveCallback = null)
    {
        parent::__construct($name, $attribute, $resolveCallback);

        // Register any existing layouts.
        $this->registerLayoutsFromEvent();
    }

    /**
     * {@inheritdoc}
     */
    protected function registerLayoutsFromEvent()
    {
        $pageContentEvent = new PageContentEvent($this);
        event($pageContentEvent);
    }

    /**
     * Excludes layouts by name.
     *
     * @param array $layouts Layout names to exclude.
     *
     * @return self
     */
    public function exclude(array $layouts)
    {
        $filter = $this->layouts->filter(function ($layout) use ($layouts) {
            return ! in_array($layout->name(), $layouts);
        });

        $this->layouts = $filter;
        $this->withMeta(['layouts' => $this->layouts]);

        return $this;
    }
}
