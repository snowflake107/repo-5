<?php

namespace Creode\NovaPageBuilder\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Creode\NovaPageBuilder\NovaPageBuilder
 */
class NovaPageBuilder extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \Creode\NovaPageBuilder\NovaPageBuilder::class;
    }
}
