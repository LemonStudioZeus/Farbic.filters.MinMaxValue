(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        filters = fabric.Image.filters,
        createClass = fabric.util.createClass;

    /**
     * Minvalue filter class
     * @class fabric.Image.filters.Pixelate
     * @memberOf fabric.Image.filters
     * @extends fabric.Image.filters.BaseFilter
     * @see {@link fabric.Image.filters.Pixelate#initialize} for constructor definition
     * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
     * @example
     * var filter = new fabric.Image.filters.Minvalue({
     *   blocksize: 3
     * });
     * object.filters.push(filter);
     * object.applyFilters();
     */
    filters.MinMaxvalue = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.MinMaxvalue.prototype */ {

        /**
         * Filter type
         * @param {String} type
         * @default
         */
        type: 'MinMaxvalue',

        blocksize: 3,

        mainParameter: 'blocksize',

        mode: 'min', //min or max

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
         * Apply the Pixelate operation to a Uint8ClampedArray representing the pixels of an image.
         *
         * @param {Object} options
         * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
         */
        applyTo2d: function(options) {
            var imageData = options.imageData,
                data = imageData.data,
                iLen = imageData.height,
                jLen = imageData.width,
                index, i, j, r, g, b, a,
                _i, _j, _iLen, _jLen;

            var mode = this.mode;
            var radius = this.blocksize / 2;
            radius = radius.toFixed(0);
            var _index;

            var org_data = data.slice(0);




            for (i = 0; i < iLen; i++) {
                for (j = 0; j < jLen; j++) {
                    index = (i * 4) * jLen + (j * 4);

                    var minValue = 255,
                        maxValue = 0;

                    for (_i = -radius; _i < radius; _i++) {

                        for (_j = -radius; _j < radius; _j++) {

                            var __i = Math.min(Math.max(0, _i + i), iLen - 1);
                            var __j = Math.min(Math.max(0, _j + j), jLen - 1);


                            _index = (__i * 4) * jLen + (__j * 4);

                            minValue = Math.min(minValue, org_data[_index]);
                            maxValue = Math.max(maxValue, org_data[_index]);

                        }
                    }

                    if (mode == "min") {
                        data[index] = minValue;
                        data[index + 1] = minValue;
                        data[index + 2] = minValue;
                        //data[index + 3] = minValue;
                    }
                    if (mode == "max") {
                        data[index] = maxValue;
                        data[index + 1] = maxValue;
                        data[index + 2] = maxValue;
                        //data[index + 3] = maxValue;
                    }
                }
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
     * @return {fabric.Image.filters.MinMaxvalue} Instance of fabric.Image.filters.MinMaxvalue
     */
    fabric.Image.filters.MinMaxvalue.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);