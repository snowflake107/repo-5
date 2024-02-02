<?php

namespace Creode\NovaPageBuilder\Traits;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Creode\NovaPageBuilder\Services\BlockRenderer;

trait HasComponents
{
    /**
     * Exposes a set of components from the Page Builder.
     *
     * @return Attribute
     */
    protected function components(): Attribute
    {
        $blockRendererService = app()->make(BlockRenderer::class);
        return Attribute::make(
            get: function () use ($blockRendererService) {
                $componentField = $this->componentField;
                return $blockRendererService->render($this->{$componentField});
            }
        );
    }
}
