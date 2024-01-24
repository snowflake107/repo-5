# Nova Page Builder

[![Latest Version on Packagist](https://img.shields.io/packagist/v/creode/nova-page-builder.svg?style=flat-square)](https://packagist.org/packages/creode/nova-page-builder)
[![Total Downloads](https://img.shields.io/packagist/dt/creode/nova-page-builder.svg?style=flat-square)](https://packagist.org/packages/creode/nova-page-builder)

Exposes a simple customisable page builder in Laravel Nova, built on top of Flexible Content fields.

## Installation

You can install the package via composer:

```bash
composer require creode/nova-page-builder
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="nova-page-builder-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="nova-page-builder-views"
```

## Usage

```php
$novaPageBuilder = new Creode\NovaPageBuilder();
echo $novaPageBuilder->echoPhrase('Hello, Creode!');
```

## Testing

```bash
composer test
```

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
