module.exports = {
    extends: 'react-app',
    plugins: ['react', 'react-hooks', 'prettier'],
    parser: 'babel-eslint',
    env: {
        jest: true,
        browser: true,
        node: true,
        es6: true,
    },
    rules: {
        semi: ['warn', 'always'],
        quotes: ['warn', 'single'],
        'no-unused-vars': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        'react/jsx-indent': ['error', 4],
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
        // 'react/forbid-prop-types': [0, { forbid: ['any'] }],
        // 'react/prop-types': 0,
    },
};
