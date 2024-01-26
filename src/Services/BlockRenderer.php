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

                $layoutAttributes = json_decode(json_encode($layout->getAttributes()), true);
                $view = $pageContentBlockViewsEvent->views[$layout->name()];

                $pageContentBlockAttributesEvent = $this->firePreRenderEvent($view, $layoutAttributes);

                return new PageContentBlock(
                    $view,
                    array_merge($layoutAttributes, $pageContentBlockAttributesEvent->attributes),
                );
            }
        );
    }

    /**
     * Fires off a pre-render event.
     *
     * @return \Creode\NovaPageBuilder\Events\PageContentBlockAttributesEvent
     */
    private function firePreRenderEvent($view, $attributes)
    {
        $pageContentBlockAttributesEvent = new PageContentBlockAttributesEvent($view, $attributes);
        event($pageContentBlockAttributesEvent);

        return $pageContentBlockAttributesEvent;
    }
}
