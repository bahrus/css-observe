import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'css-observe.js',
    output: {
        dir: 'dist/',
        format: 'es'
    },
    plugins: [nodeResolve()]
}