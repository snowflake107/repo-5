# Nova Page Builder

[![Latest Version on Packagist](https://img.shields.io/packagist/v/creode/nova-page-builder.svg?style=flat-square)](https://packagist.org/packages/creode/nova-page-builder)
[![Total Downloads](https://img.shields.io/packagist/dt/creode/nova-page-builder.svg?style=flat-square)](https://packagist.org/packages/creode/nova-page-builder)

Exposes a simple customisable page builder in Laravel Nova, built on top of Flexible Content fields.

## Installation

You can install the package via composer:

```bash
composer require creode/nova-page-builder
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="nova-page-builder-views"
```

## Usage
This package is split from a previous module titled `nova-pages`. That module exposed page builder functionality where new components could be created easily. This module splits the page builder functionality from the page management functionality, allowing you to use the page builder without the page management.

This module heavily utilises the [nova-flexible-content](https://github.com/whitecube/nova-flexible-content) package, and as such, you should familiarise yourself with that package before using this one.

### Page Builder Field
This module creates a new field type, `Creode\NovaPageBuilder\Nova\Fields\PageBuilder`. This field type is a wrapper around the `Flexible` field type, and as such, you can use all of the same methods as you would with the `Flexible` field type. The only difference is that the `PageBuilder` field type will automatically register all of the components that you have created.

### Excluding Components
If you wish to exclude certain components from being used within the field, you can do so by passing an array of component names to the `exclude` method on the `PageBuilder` field type. For example, if you wish to exclude the `Banner` component, you can do so by adding the following to your `Page` Nova resource:

```php
public function fields(Request $request)
{
    return [
        // ...
        PageBuilder::make('Content')
            ->exclude(['banner']),
    ];
}
```

### Rendering Components
This module exposes a blade file that can be used to render the components on the front-end of your site.

We also include a trait that needs to be added to your model. This trait will allow you to access the content of the page builder field and allow you to pass the components to the blade file. The trait is `Creode\NovaPageBuilder\Traits\HasPageBuilderContent`. You can use this trait in your model like so:

```php
use Creode\NovaPageBuilder\Traits\HasComponents;

class Page extends Model
{
    use HasPageBuilderContent;

    /**
     * The name of your page builder field.
     */
    protected $componentField = 'content';
}
```

Once the above has been added to your model you can render the components of the page builder field by calling `$page->components` and passing this to the view file below:

For example:

```php
@include('page-builder::components', ['components' => $page->components])
```

### Extension
As previously stated, this module will not define any format of page content. However it does contain the infrastructure for defining content blocks with minimal code. To define a new content block you will need to define an extension of the `Creode\NovaPageBuilder\Abstracts\PageBlockAbstract` class. Your new class should then be instantiated within the boot method of a service provider.

As part of your new class, you must define a "$label" string property. This will be the human readable representation of your new content block. You must define a "$name" string property. This will be how Laravel will reference your content block. You must define a "$view" string property. This should reference a view file containing markup and/or template logic for rendering your block on front-end pages. You must define a "fields" method. This should return an array of Laravel Nova field objects.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Creode](https://github.com/creode)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
