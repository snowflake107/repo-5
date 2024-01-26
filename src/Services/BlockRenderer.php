<?php

namespace Creode\NovaPageBuilder\Services;

use Creode\NovaPageBuilder\Events\PageContentBlockAttributesEvent;
use Creode\NovaPageBuilder\PageContentBlock;
use Whitecube\NovaFlexibleContent\Layouts\Layout;
use Creode\NovaPageBuilder\Events\PageContentBlockViewsEvent;

class BlockRenderer
{
    /**
     * Renders a block.
     *
     * @param \Whitecube\NovaFlexibleContent\Layouts\Collection|array<\Whitecube\NovaFlexibleContent\Layouts\Layout> $content
     *
     * @return \Illuminate\Support\Collection<\Creode\NovaPageBuilder\PageContentBlock>
     */
    public function render($content)
    {
        $pageContentBlockViewsEvent = new PageContentBlockViewsEvent();
        event($pageContentBlockViewsEvent);

        return $content->map(
            function (Layout $layout) use ($pageContentBlockViewsEvent) {
                if (!isset($pageContentBlockViewsEvent->views[$layout->name()])) {
                    return null;
                }

                $preprocessedAttributes = $this->preprocessAttributes(
                    $layout->name(),
                    json_decode(json_encode($layout->getAttributes()), true)
                );

                return new PageContentBlock(
                    $pageContentBlockViewsEvent->views[$layout->name()],
                    $preprocessedAttributes
                );
            }
        );
    }

    /**
     * Fires off a pre-render event.
     *
     * @param string $name
     * @param array $attributes
     *
     * @return array
     */
    private function preprocessAttributes(string $name, array $attributes)
    {
        $pageContentBlockAttributesEvent = new PageContentBlockAttributesEvent($name, $attributes);
        event($pageContentBlockAttributesEvent);

        return $pageContentBlockAttributesEvent->attributes;
    }
}
