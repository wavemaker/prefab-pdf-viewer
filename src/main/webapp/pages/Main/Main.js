/*
 * Use App.getDependency for Dependency Injection
 * eg: var DialogService = App.getDependency('DialogService');
 */

/*
 * This function will be invoked when any of this prefab's property is changed
 * @key: property name
 * @newVal: new value of the property
 * @oldVal: old value of the property
 */
var key;
var newVal;
var oldVal;
Prefab.onPropertyChange = function(key, newVal, oldVal) {
    debugger;
    key = key;
    newVal = newVal;
    oldVal = oldVal;
    Prefab.renderPdf(key, newVal, oldVal);

};

Prefab.onReady = function() {
    Prefab.renderPdf(key, newVal, oldVal);

};

/*
 * Renders a pdf file depending upon the provided properties
 */
Prefab.renderPdf = function (key, newVal, oldVal) {

    var pdfData;
    var url;
    if (Prefab.input !== undefined) {
        if (Prefab.pdftype === 'base64') {
            pdfData = atob(Prefab.input)
            url = {
                data: pdfData
            }
        } else {
            pdfData = Prefab.input;
            url = pdfData;
        }


        // Loaded via < script > tag, create shortcut to access PDF.js exports.
        var pdfjsLib = window['pdfjs-dist/build/pdf'];

        // The workerSrc property shall be specified.
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

        var pdfDoc = null,
            pageNum = 1,
            pageRendering = false,
            pageNumPending = null,
            scale = 0.8,
            canvas = document.getElementById('the-canvas'),
            ctx = canvas.getContext('2d');

        /**
         * Get page info from document, resize canvas accordingly, and render page.
         * @param num Page number.
         */
        function renderPage(num) {
            pageRendering = true;
            // Using promise to fetch the page
            pdfDoc.getPage(num).then(function(page) {
                var viewport = page.getViewport({
                    scale: scale
                });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);

                // Wait for rendering to finish
                renderTask.promise.then(function() {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        // New page rendering is pending
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });

            // Update page counters
            document.getElementById('page_num').textContent = num;
        }

        /**
         * If another page rendering in progress, waits until the rendering is
         * finised. Otherwise, executes rendering immediately.
         */
        function queueRenderPage(num) {

            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        /**
         * Displays previous page.
         */
        function onPrevPage() {
            if (pageNum <= 1) {
                return;
            }
            pageNum--;
            queueRenderPage(pageNum);
        }
        document.getElementById('prev').addEventListener('click', onPrevPage);

        /**
         * Displays next page.
         */
        function onNextPage() {

            if (pageNum >= pdfDoc.numPages) {
                return;
            }
            pageNum++;
            queueRenderPage(pageNum);
        }
        document.getElementById('next').addEventListener('click', onNextPage);

        /**
         * Asynchronously downloads PDF.
         */
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page_count').textContent = pdfDoc.numPages;
            if (pdfDoc.numPages <= 1) {
                document.getElementById('prev').style.display = "none";
                document.getElementById('next').style.display = "none";
                document.getElementById('page_num').style.display = "none";
                document.getElementById('page_count').style.display = "none";
                document.getElementById('textspan').style.display = "none";
            } else {
                document.getElementById('prev').style.display = "inline-block";
                document.getElementById('next').style.display = "inline-block";
                document.getElementById('page_num').style.display = "inline-block ";
                document.getElementById('page_count').style.display = "inline-block";
                document.getElementById('textspan').style.display = "inline-block";
            }
            // Initial/first page rendering
            renderPage(pageNum);
        });
    }
};