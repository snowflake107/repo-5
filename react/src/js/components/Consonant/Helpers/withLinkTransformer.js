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

function withLinkTransformer(Component) {
    return function WrappedComponent(props) {
        const getConfig = useConfig();
        const enabled = getConfig('linkTransformer', 'enabled');
        const hostnameTransforms = getConfig('linkTransformer', 'hostnameTransforms');
        const transformedProps = React.useMemo(() => {
            if (!enabled) return props;
            return transformNestedProps(props, hostnameTransforms);
        }, [enabled, hostnameTransforms, props]);

        return <Component {...transformedProps} />;
    };
}

export default withLinkTransformer;
