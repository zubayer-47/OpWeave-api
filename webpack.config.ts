import path from 'path'
import nodeExternals from 'webpack-node-externals'
import { Configuration } from 'webpack'
import WebpackShellPluginNext from 'webpack-shell-plugin-next'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
const getConfig = (_env: { [key: string]: string }, argv: { [key: string]: string }): Configuration => {
  require('dotenv').config({
    path: path.resolve(__dirname)
  })
  return {
    entry: './src/index.ts',
    target: 'node',
    mode: argv.mode === 'production' ? 'production' : 'development',
    externals: [nodeExternals()],
    plugins: [
      new WebpackShellPluginNext({
        onBuildStart: {
          scripts: ['npm run clean:dev && npm run clean:prod'],
          blocking: true,
          parallel: false
        },
        onBuildEnd: {
          scripts: ['npm run dev'],
          blocking: false,
          parallel: true
        }
      })
    ],
    module: {
      rules: [
        {
          test: /\.(ts|js)$/,
          loader: 'ts-loader',
          options: {},
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
      extensions: ['.ts', '.js'],
      alias: {
        src: path.resolve(__dirname, 'src'),
        libs: path.resolve(__dirname, 'src/libs/*'),
        repos: path.resolve(__dirname, 'src/repos/*'),
        controllers: path.resolve(__dirname, 'src/controllers/*'),
        middlewares: path.resolve(__dirname, 'src/middlewares/*')
      }
    },
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'index.js'
    },
    optimization: {
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all'
      }
    }
  }
}
export default getConfig
