/**
 * Created by maikuraki on 2016/11/7.
 */
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var config = {
    entry: {
        app: ['babel-polyfill','./js/app.js']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'bundle_[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react', 'stage-0']
                },
                exclude: /node_modules/,
            },
            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=8192&name=[path][name].[ext]'
            }
        ]
    },
    externals: [
        (function () {
          var IGNORES = [
            'electron'
          ];
          return function (context, request, callback) {
            if (IGNORES.indexOf(request) >= 0) {
              return callback(null, "require('" + request + "')");
            }
            return callback();
          };
        })()
      ],
    plugins: [
        new ExtractTextPlugin("bundle_style.css"),
        // new webpack.DefinePlugin({
        //     'process.env': {
        //         'NODE_ENV': JSON.stringify('production')
        //     }
        // }),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: true
        //     }
        // })
    ]
};

module.exports = config;