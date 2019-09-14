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
     * @see {@link fabric.Image.filters.BlackWhiteThreshold#initialize} for constructor definition
     * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
     * @example
     * var filter = new fabric.Image.filters.Minvalue({
     *   blocksize: 3
     * });
     * object.filters.push(filter);
     * object.applyFilters();
     */
    filters.BlackWhiteThreshold = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.MinMaxvalue.prototype */ {

        /**
         * Filter type
         * @param {String} type
         * @default
         */
        type: 'BlackWhiteThreshold',

        threshold: 127,

        mainParameter: 'threshold',

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
                index, i, j, r, g, b, a;

            var threshold = this.threshold;

            for (i = 0; i < iLen; i++) {
                for (j = 0; j < jLen; j++) {
                    index = (i * 4) * jLen + (j * 4);

                    var average = (data[index] * 0.3 + data[index + 1] * 0.59 + data[index + 2] * 0.11).toFixed(0),
                        currentAlpha = data[index + 3];

                    threshold = threshold || 127;

                    average = (Number(average) < Number(threshold)) ? 0 : 255;

                    data[index] = average;
                    data[index + 1] = average;
                    data[index + 2] = average;
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
     * @return {fabric.Image.filters.BlackWhiteThreshold} Instance of fabric.Image.filters.MinMaxvalue
     */
    fabric.Image.filters.BlackWhiteThreshold.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);