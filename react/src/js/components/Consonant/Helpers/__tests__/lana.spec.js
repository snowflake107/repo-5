import { loadLana, logLana } from '../lana';

describe('lana', () => {
    let originalFetch;
    let originalAddEventListener;
    let originalRemoveEventListener;
    let originalConsoleLog;

    beforeEach(() => {
        originalFetch = global.fetch;
        originalAddEventListener = global.addEventListener;
        originalRemoveEventListener = global.removeEventListener;
        originalConsoleLog = console.log;

        global.fetch = jest.fn(() => Promise.resolve());
        global.addEventListener = jest.fn();
        global.removeEventListener = jest.fn();
        console.log = jest.fn();

        global.window = {
            lana: undefined,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            location: {
                href: 'https://example.com',
            },
        };
    });

    afterEach(() => {
        global.fetch = originalFetch;
        global.addEventListener = originalAddEventListener;
        global.removeEventListener = originalRemoveEventListener;
        console.log = originalConsoleLog;
        delete global.window;
    });

    describe('loadLana', () => {
        it('should set up lana object and error listeners', async () => {
            await loadLana();

            expect(window.lana).toBeDefined();
            expect(window.lana.log).toBeInstanceOf(Function);
            expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
            expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
        });

        it('should not modify existing lana object if already defined', async () => {
            const mockLanaLog = jest.fn();
            window.lana = { log: mockLanaLog };

            await loadLana();

            expect(window.lana.log).toBe(mockLanaLog);
        });
    });

    describe('logLana', () => {
        it('should call window.lana.log with correct arguments', async () => {
            const mockLanaLog = jest.fn();
            window.lana = { log: mockLanaLog };

            const message = 'Test message';
            const tags = 'test-tag';
            const error = new Error('Test error');

            await logLana({ message, tags, e: error });

            expect(mockLanaLog).toHaveBeenCalledWith(
                expect.stringContaining(message),
                expect.objectContaining({
                    clientId: 'chimera',
                    sampleRate: 1,
                    tags,
                }),
            );
        });

        it('should handle errors when window.lana is not defined', async () => {
            delete window.lana;

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            await logLana({ message: 'Test message' });
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
});
