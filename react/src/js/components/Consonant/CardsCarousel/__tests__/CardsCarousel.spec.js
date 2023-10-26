import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {
    fireEvent,
    act,
    render,
} from '@testing-library/react';

import Container from '../../Container/Container';
import config from '../../Testing/Mocks/config.json';
import cards from '../../Testing/Mocks/cards.json';
import setupIntersectionObserverMock from '../../Testing/Mocks/intersectionObserver';
import jestMocks from '../../Testing/Utils/JestMocks';


global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: 'ok',
        status: 200,
        statusText: 'success',
        url: 'test.html',
        json: () => Promise.resolve({ cards }),
    }));

setupIntersectionObserverMock();
jestMocks.lana();

let configToUse;
let inner;
let grid;
let nextButton;
let prevButton;

afterEach(() => {
    configToUse = {};

    // find the Next Button
    inner = undefined;
    grid = undefined;
    nextButton = undefined;
    prevButton = undefined;
});

beforeEach(async () => {
    global.innerWidth = 1400;

    configToUse = config;
    configToUse.collection.layout = {
        container: 'carousel',
        gutter: '3x',
        type: '3up',
    };

    await act(async () => render(<Container config={configToUse} />));

    // find the Next Button
    inner = document.querySelector('.consonant-Wrapper-inner');
    grid = inner.querySelector('.consonant-CardsGrid--3up');
    nextButton = inner.querySelector('[name = next]');
});

describe('Consonant/Container/Load More Button', () => {
    test('should render the Next button on load', () => {
        expect(inner).toBeInTheDocument();
        expect(grid).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();

        expect(grid.children).toHaveLength(22);
    });
    test('should render Previous button after click of Next Button', () => {
        fireEvent.click(nextButton);

        prevButton = inner.querySelector('[name = previous]');

        expect(prevButton).toBeInTheDocument();
    });
    test('should progressively load cards on each click', () => {
        fireEvent.click(nextButton);
        expect(grid.children).toHaveLength(22);
    });
    test('should load analytics for carousel buttons', () => {
        expect(nextButton).toHaveAttribute('daa-ll', 'Next');
        fireEvent.click(nextButton);
        prevButton = inner.querySelector('[name = previous]');
        expect(prevButton).toHaveAttribute('daa-ll', 'Previous');
    });
});
