<?php

namespace Creode\NovaPageBuilder\Services;

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
     * @return \Illuminate\Support\Collection<\Modules\Pages\app\Models\PageContentBlock>
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

                return new PageContentBlock(
                    $pageContentBlockViewsEvent->views[$layout->name()],
                    json_decode(json_encode($layout->getAttributes()), true)
                );
            }
        );
    }
}
