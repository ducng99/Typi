module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty": "off",
        "@typescript-eslint/no-unused-labels": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-var-requires": "off",
        "vue/no-unused-components": [
            "error",
            {
                "ignoreWhenBindingPresent": true
            }
        ]
    },
    overrides: [
       {
           files: [
               '**/__tests__/*.{j,t}s?(x)',
               '**/tests/unit/**/*.spec.{j,t}s?(x)'
           ],
           env: {
               mocha: true
           }
       }
    ]
}
