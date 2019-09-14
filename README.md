# fabric.Image.filters.MinMaxvalue
//最小值 最大值过滤
var f = new fabric.Image.filters.MinMaxvalue({
                    blockSize:3
                });
                f.mode = 'min'; // or 'max'
                imgInstance.filters.push(f);

//高斯反差过滤
fabric.Image.filters.GenGaussFilter({
   radius1: 2,
   radius2:10,
   blurAlphaChannel:false
   
})

//高斯模糊
fabric.Image.filters.StackBlur
//Gaussian filter 
imgInstance.filters.push(new fabric.Image.filters.StackBlur({
    radius: 3,
    blurAlphaChannel:false
}));
