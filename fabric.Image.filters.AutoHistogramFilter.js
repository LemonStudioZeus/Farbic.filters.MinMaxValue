(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        filters = fabric.Image.filters,
        createClass = fabric.util.createClass;

    /**
     * AutoHistogramFilter  filter class
     * @class fabric.Image.filters.Pixelate
     * @memberOf fabric.Image.filters
     * @extends fabric.Image.filters.BaseFilter
     * @see {@link fabric.Image.filters.AutoHistogramFilter #initialize} for constructor definition
     * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
     * @example
     * var filter = new fabric.Image.filters.AutoHistogramFilter( );
     * object.filters.push(filter);
     * object.applyFilters();
     */
    filters.AutoHistogramFilter = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.MinMaxvalue.prototype */ {

        /**
         * Filter type
         * @param {String} type
         * @default
         */
        type: 'AutoHistogramFilter',

        //mainParameter: '',

        /**
         * Fragment source for the Minvalue program
         */
        fragmentSource: 'precision highp float;\n' +
            'uniform sampler2D uTexture;\n' +
            'uniform float uBlocksize;\n' +
            'uniform float uStepW;\n' +
            'uniform float uStepH;\n' +
            'varying vec2 vTexCoord;\n' +
            'void main() {\n' +
            'float blockW = uBlocksize * uStepW;\n' +
            'float blockH = uBlocksize * uStepW;\n' +
            'int posX = int(vTexCoord.x / blockW);\n' +
            'int posY = int(vTexCoord.y / blockH);\n' +
            'float fposX = float(posX);\n' +
            'float fposY = float(posY);\n' +
            'vec2 squareCoords = vec2(fposX * blockW, fposY * blockH);\n' +
            'vec4 color = texture2D(uTexture, squareCoords);\n' +
            'gl_FragColor = color;\n' +
            '}',

        /**
         * Apply the GenGaussFilter operation to a Uint8ClampedArray representing the pixels of an image.
         *
         * @param {Object} options
         * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
         */
        applyTo2d: function(options) {
            var imageData = options.imageData;
            var w = imageData.width;
            var h = imageData.height;

            equalize(imageData, w, h);

            functiont equalize(imageData, w, h) {
                // build histogram (pdf)
                var hist = histogram(imageData, 0, 0, w, h);

                // compute cdf
                var cdf = buildcdf(hist);
                var cumuhist = normalizecdf(cdf, 255);

                // equalize
                var i, j, index,
                    iLen = imageData.height,
                    jLen = imageData.width;
                for (i = 0; i < iLen; i++) {
                    for (j = 0; j < jLen; j++) {
                        index = (i * 4) * jLen + (j * 4);

                        var lev = imageData.data[index];

                        var r = imageData.data[index];
                        var g = imageData.data[index + 1];
                        var b = imageData.data[index + 2];
                        var a = imageData.data[index + 3];

                        var cI = cumuhist[lev];
                        var ratio = cI / lev;

                        imageData.data[index] = Math.round(clamp(r * ratio, 0, 255));
                        imageData.data[index + 1] = Math.round(clamp(g * ratio, 0, 255));
                        imageData.data[index + 2] = Math.round(clamp(b * ratio, 0, 255));


                    }
                }
                /*
                return src.map(function(r, g, b, a, x, y) {
                    var index = (x * 4) * w + (y * 4);
                    var lev = gimg.data[index];
                    var cI = cumuhist[lev];
                    var ratio = cI / lev;
                    var c = new Color(r * ratio, g * ratio, b * ratio, a);
                    return c.clamp().round();
                });*/
            }

            function clamp(v, lower, upper) {
                return Math.max(lower, Math.min(v, upper));
            }



            // build histogram of specified image region
            function histogram(img, x1, y1, x2, y2, num_bins) {
                if (num_bins == undefined)
                    num_bins = 256;

                var h = img.h,
                    w = img.w;
                var hist = [];
                var i, x, y, idx, val;

                // initialize the histogram
                for (i = 0; i < num_bins; ++i)
                    hist[i] = 0;

                // loop over every single pixel
                for (y = y1, idx = 0; y < y2; ++y) {
                    for (x = x1; x < x2; ++x, idx += 4) {
                        // figure out which bin it is in
                        val = Math.floor((img.data[idx] / 255.0) * (num_bins - 1));
                        ++hist[val];
                    }
                }

                return hist;
            }

            // build cdf from given pdf
            function buildcdf(hist, num_bins) {
                if (num_bins == undefined)
                    num_bins = 256;

                var cumuhist = [];
                cumuhist[0] = hist[0];
                for (var i = 1; i < num_bins; ++i)
                    cumuhist[i] = cumuhist[i - 1] + hist[i];

                return cumuhist;
            }

            function normalizecdf(cdf, scale, num_bins) {
                if (num_bins == undefined)
                    num_bins = 256;
                var scale = scale || 1.0;

                var total = cdf[num_bins - 1];
                var ncdf = new Array(num_bins);
                for (var i = 0; i < num_bins; ++i)
                    ncdf[i] = cdf[i] / total * scale;

                return ncdf;
            }
        },

        /**
         * Indicate when the filter is not gonna apply changes to the image
         **/
        isNeutralState: function() {
            return this.blocksize === 1;
        },

        /**
         * Return WebGL uniform locations for this filter's shader.
         *
         * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
         * @param {WebGLShaderProgram} program This filter's compiled shader program.
         */
        getUniformLocations: function(gl, program) {
            return {
                uBlocksize: gl.getUniformLocation(program, 'uBlocksize'),
                uStepW: gl.getUniformLocation(program, 'uStepW'),
                uStepH: gl.getUniformLocation(program, 'uStepH'),
            };
        },

        /**
         * Send data from this filter to its shader program's uniforms.
         *
         * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
         * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
         */
        sendUniformData: function(gl, uniformLocations) {
            gl.uniform1f(uniformLocations.uBlocksize, this.blocksize);
        },
    });

    /**
     * Returns filter instance from an object representation
     * @static
     * @param {Object} object Object to create an instance from
     * @param {Function} [callback] to be invoked after filter creation
     * @return {fabric.Image.filters.AutoHistogramFilter} Instance of fabric.Image.filters.MinMaxvalue
     */
    fabric.Image.filters.AutoHistogramFilter.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);