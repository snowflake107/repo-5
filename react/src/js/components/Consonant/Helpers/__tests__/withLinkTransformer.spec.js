import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import withLinkTransformer from '../withLinkTransformer';
import { ConfigContext } from '../contexts';

// Mock component to test link transformation
// eslint-disable-next-line react/prop-types
const TestComponent = ({ href, text }) => <a href={href}>{text}</a>;
const TransformedComponent = withLinkTransformer(TestComponent);

describe('withLinkTransformer', () => {
    const mockConfig = {
        linkTransformer: {
            enabled: true,
            hostnameTransforms: [
                {
                    from: '(https?:\\/\\/)business\\.adobe\\.com((?!\\/content\\/dam).*)',
                    to: '$1business.stage.adobe.com$2',
                },
                {
                    from: '(https?:\\/\\/)(www\\.adobe\\.com)(\\/max.*)',
                    to: '$1www.stage.adobe.com$3',
                },
            ],
        },
    };

    // eslint-disable-next-line max-len
    const renderWithConfig = (ui, config) => render(<ConfigContext.Provider value={config}>{ui}</ConfigContext.Provider>);

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    test('transforms business.adobe.com links when enabled', () => {
        renderWithConfig(
            <TransformedComponent
                href="https://business.adobe.com/products/magento/magento-commerce.html"
                text="Magento Commerce"
            />,
            mockConfig,
        );
        const link = screen.getByRole('link', { name: /Magento Commerce/i });
        expect(link).toHaveAttribute('href', 'https://business.stage.adobe.com/products/magento/magento-commerce.html');
    });

    test('transforms www.adobe.com/max links when enabled', () => {
        renderWithConfig(
            <TransformedComponent
                href="https://www.adobe.com/max/2023.html"
                text="Adobe MAX 2023"
            />,
            mockConfig,
        );
        const link = screen.getByRole('link', { name: /Adobe MAX 2023/i });
        expect(link).toHaveAttribute('href', 'https://www.stage.adobe.com/max/2023.html');
    });

    test('does not transform links when disabled in config', () => {
        const disabledConfig = {
            ...mockConfig,
            linkTransformer: { ...mockConfig.linkTransformer, enabled: false },
        };

        renderWithConfig(
            <TransformedComponent
                href="https://business.adobe.com/products/magento/magento-commerce.html"
                text="Magento Commerce"
            />,
            disabledConfig,
        );
        const link = screen.getByRole('link', { name: /Magento Commerce/i });
        expect(link).toHaveAttribute('href', 'https://business.adobe.com/products/magento/magento-commerce.html');
    });

    test('uses localStorage settings when available', () => {
        localStorage.setItem('linkTransformerSettings', JSON.stringify({
            enabled: true,
            hostnameTransforms: [
                {
                    from: '(https?:\\/\\/)www\\.adobe\\.com',
                    to: '$1www.test.adobe.com',
                },
            ],
        }));

        renderWithConfig(
            <TransformedComponent
                href="https://www.adobe.com/products/photoshop.html"
                text="Photoshop"
            />,
            { linkTransformer: { enabled: false } },
        );
        const link = screen.getByRole('link', { name: /Photoshop/i });
        expect(link).toHaveAttribute('href', 'https://www.test.adobe.com/products/photoshop.html');
    });

    test('does not transform non-matching links', () => {
        renderWithConfig(
            <TransformedComponent
                href="https://example.com"
                text="Example"
            />,
            mockConfig,
        );
        const link = screen.getByRole('link', { name: /Example/i });
        expect(link).toHaveAttribute('href', 'https://example.com');
    });


    test('transforms nested props correctly', () => {
        // eslint-disable-next-line react/prop-types
        const NestedComponent = ({ data }) => (
            <div>
                {/* eslint-disable-next-line react/prop-types */}
                <a href={data.link}>{data.text}</a>
                {/* eslint-disable-next-line react/prop-types */}
                <img src={data.image} alt="Test" />
            </div>
        );
        const TransformedNestedComponent = withLinkTransformer(NestedComponent);

        renderWithConfig(
            <TransformedNestedComponent
                data={{
                    link: 'https://business.adobe.com/products/magento/magento-commerce.html',
                    text: 'Magento Commerce',
                    image: 'https://www.adobe.com/content/dam/cc/us/en/creative-cloud/photography/discover/landscape-photography/CODERED_B1_landscape_P2d_690x455.jpg.img.jpg',
                }}
            />,
            mockConfig,
        );

        const link = screen.getByRole('link', { name: /Magento Commerce/i });
        expect(link).toHaveAttribute('href', 'https://business.stage.adobe.com/products/magento/magento-commerce.html');

        const image = screen.getByRole('img', { name: /Test/i });
        expect(image).toHaveAttribute('src', 'https://www.adobe.com/content/dam/cc/us/en/creative-cloud/photography/discover/landscape-photography/CODERED_B1_landscape_P2d_690x455.jpg.img.jpg');
    });
});

const settings = {
    enabled: true,
    hostnameTransforms: [
        {
            from: '(https?:\\/\\/)business\\.adobe\\.com((?!\\/content\\/dam).*)',
            to: '$1business.stage.adobe.com$2',
        },
        {
            from: '(https?:\\/\\/)(www\\.adobe\\.com)(\\/max.*)',
            to: '$1www.stage.adobe.com$3',
        },
    ],
};
localStorage.setItem('linkTransformerSettings', JSON.stringify(settings));
