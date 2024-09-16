/* eslint-disable */
import React from 'react';
import { useConfig } from '../Helpers/hooks';

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function transformLink(url, patterns) {
    for (const pattern of patterns) {
        const regex = new RegExp(pattern.from);
        if (regex.test(url)) {
            return url.replace(regex, pattern.to);
        }
    }
    return url;
}

function transformNestedProps(obj, hostnameTransforms) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => transformNestedProps(item, hostnameTransforms));
    }

    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && isValidURL(value)) {
            newObj[key] = transformLink(value, hostnameTransforms);
        } else if (typeof value === 'object' && value !== null) {
            newObj[key] = transformNestedProps(value, hostnameTransforms);
        } else {
            newObj[key] = value;
        }
    }
    return newObj;
}
function getLocalStorageSettings() {
    try {
        const settings = localStorage.getItem('linkTransformerSettings');
        return settings ? JSON.parse(settings) : {};
    } catch (error) {
        lana.error('Error reading from localStorage:', error);
        return {};
    }
}

function withLinkTransformer(Component) {
    return function WrappedComponent(props) {
        const getConfig = useConfig();
        const configEnabled = getConfig('linkTransformer', 'enabled') || false;
        const configHostnameTransforms = getConfig('linkTransformer', 'hostnameTransforms') || [];

        const localStorageSettings = getLocalStorageSettings();
        const localStorageEnabled = localStorageSettings && localStorageSettings.enabled !== undefined ? localStorageSettings.enabled : false;

        const enabled = configEnabled || localStorageEnabled;
        const haveLocalStorageHostnameTransforms = localStorageEnabled && localStorageSettings.hostnameTransforms;
        const hostnameTransforms = haveLocalStorageHostnameTransforms ? localStorageSettings.hostnameTransforms : configHostnameTransforms;

        const transformedProps = React.useMemo(() => {
            if (!enabled) return props;
            return transformNestedProps(props, hostnameTransforms);
        }, [enabled, hostnameTransforms, props]);

        return <Component {...transformedProps} />;
    };
}

export default withLinkTransformer;
