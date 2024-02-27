const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const config = require('./config')

const getTemplateFiles = (templateDir) => {
  const templateFiles = [];
  const readFiles = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        readFiles(filePath);
      } else if (path.extname(filePath) === '.pug') {
        templateFiles.push(filePath);
      }
    });
  };
  readFiles(templateDir);
  return templateFiles;
};

const generateHtmlPlugins = (templateDir) => {
  const rootDir = path.resolve(templateDir);
  const templateFiles = getTemplateFiles(rootDir);
  return templateFiles.map((filePath) => {
    const relativePath = path.relative(rootDir, filePath);
    const outputDir = path.dirname(relativePath);
    const fileName = path.basename(relativePath, '.pug');
    return new HtmlWebpackPlugin({
      filename: path.join(outputDir, `${fileName}.html`),
      template: filePath,
    });
  });
};

module.exports = {
  mode: process.env.NODE_ENV,
  target: 'web',
  entry: [path.resolve(__dirname, config.src.js, 'app.js')],
  output: {
    publicPath: process.env.NODE_ENV === 'production' ? './' : '',
    path: path.resolve(__dirname, config.dest.root),
    clean: true,
    filename: `${config.dest.js}/[name].js`,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed',
                implementation: require.resolve('sass'),
              },
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        use: 'pug-loader',
        // exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: config.src.fonts,
      },
      // {
      //   test: /\.(png|svg|jpg|jpeg|webp)$/i,
      //   type: 'asset/resource',
      // },
      // {
      //   test: /\.html$/i,
      //   loader: 'html-loader',
      // },
    ],
  },
  plugins: [
    new ImageminWebpWebpackPlugin({
      detailedLogs: true,
      overrideExtension: true,
      config: [{
        test: /\.(jpe?g|png|gif)/,
        options: {
          quality: 75,
        },
      }],
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: [config.dest.root],
        },
        onEnd: {
          copy: [
            {
              source: path.join(config.src.root, config.src.assets),
              destination: config.dest.root,
            },
          ],
        },
      },
      runTasksInSeries: true,
      runOnceInWatchMode: true,
    }),
    ...generateHtmlPlugins(config.src.pug),
    new MiniCssExtractPlugin({
      filename: `${config.dest.css}/[name].css`,
    }),
    new ESLintPlugin({
      extensions: 'js',
      emitWarning: true,
      files: path.resolve(__dirname, config.src.root),
    }),
    new StylelintPlugin({
      files: path.join(config.src.scss, '**/*.s?(a|c)ss'),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, `${config.src.root}/${config.src.assets}`),
          to: path.resolve(__dirname, config.dest.root),
        },
      ],
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin(),
    ],
  },
  resolve: {
    alias: {
      scss: path.resolve(__dirname, config.src.scss),
    },
  },
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, config.dest.root),
    },
    watchFiles: [
      path.join(__dirname, config.src.root),
    ],
    open: true,
  },
};
