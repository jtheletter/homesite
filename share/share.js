(function () {

    function buildImageEls () {
        var gridImageEl, gridItemEl, lightboxImageEl, lightboxAnchorEl, lightboxItemEl;

        // For every image file listed in file-names array...
        for (var ind = 0; ind < fileNames.length; ind++) {

            // Make grid image.
            gridImageEl = document.createElement('img');
            gridImageEl.classList.add('grid-image');
            gridImageEl.setAttribute('src', `photos/${fileNames[ind]}`);
            gridImageEl.setAttribute('alt', fileNames[ind]);
            gridImageEl.setAttribute('title', 'Open Image');
            gridImageEl.dataset.index = ind;
            gridImageEl.addEventListener('click', enterLightbox);

            // Make grid item, append grid image.
            gridItemEl = document.createElement('li');
            gridItemEl.classList.add('grid-item');
            gridItemEl.appendChild(gridImageEl);

            // Append grid item to grid wrap.
            gridWrapEl.appendChild(gridItemEl);

            // Make lightbox image.
            lightboxImageEl = document.createElement('img');
            lightboxImageEl.classList.add('lightbox-image');
            lightboxImageEl.setAttribute('src', `photos/${fileNames[ind]}`);
            lightboxImageEl.setAttribute('alt', fileNames[ind]);

            // Make lightbox item, append lightbox image.
            lightboxItemEl = document.createElement('li');
            lightboxItemEl.classList.add('lightbox-item');
            lightboxItemEl.appendChild(lightboxImageEl);

            // Append lightbox item to lightbox list.
            lightboxListEl.appendChild(lightboxItemEl);
        }

        // Set lightbox image list width to accommodate one full viewport width for each image (to prevent wrapping).
        lightboxListEl.style.width = `${100 * fileNames.length}vw`;
    }

    function enterLightbox () {
        // Get filename index from grid image.
        lightboxIndex = parseInt(this.dataset.index, 10) || 0;

        // Move lightbox list to position.
        lightboxListEl.style.transform = `translateX(-${100 * lightboxIndex}vw)`;

        lightboxWrapEl.classList.add('lit');
        rootEl.classList.add('no-scroll');
    }

    function exitLightbox () {
        lightboxWrapEl.classList.remove('lit');
        rootEl.classList.remove('no-scroll');
    }

    function getRefs () {
        rootEl = document.documentElement;
        gridWrapEl = document.getElementById('grid-wrap');
        lightboxButtonExitEl = document.getElementById('lightbox-button-exit');
        lightboxButtonNextEl = document.getElementById('lightbox-button-next');
        lightboxButtonPrevEl = document.getElementById('lightbox-button-prev');
        lightboxCurtainEl = document.getElementById('lightbox-curtain');
        lightboxListEl = document.getElementById('grid-wrap');
        lightboxListEl = document.getElementById('lightbox-list');
        lightboxWrapEl = document.getElementById('lightbox-wrap');
    }

    function goToNextImage () {
        lightboxIndex += 1;
        // If last image, go to first.
        if (fileNames.length <= lightboxIndex) {
            lightboxIndex = 0;
        }
        lightboxListEl.style.transform = `translateX(-${100 * lightboxIndex}vw)`;
    }

    function goToPrevImage () {
        lightboxIndex -= 1;
        // If first image, go to last.
        if (lightboxIndex < 0) {
            lightboxIndex = fileNames.length - 1;
        }
        lightboxListEl.style.transform = `translateX(-${100 * lightboxIndex}vw)`;
    }

    function handleTouchend (evt) {
        // If multiple fingers or zoomed or tracker reset...
        if (evt.changedTouches.length !== 1 || window.innerWidth !== window.outerWidth || touchStartX === null) {
            resetLightboxForImage(evt.target);
            return;
        }

        var diffX = evt.changedTouches[0].clientX - touchStartX;
        var diffY = evt.changedTouches[0].clientY - touchStartY;
        var limitX = window.innerWidth * (3/8); // Arbitrarily chosen.
        var limitY = window.innerHeight * (1/4); // Arbitrarily chosen.

        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > limitY) {
            // Movement is mostly vertical and beyond limit.
            // Undo possible vertical styles. Reset trackers. Exit lightbox. Return.
            evt.target.style.transform = 'scale(1) translateY(0)';
            lightboxCurtainEl.style.opacity = 1;
            touchStartX = null;
            touchStartY = null;
            exitLightbox();
            return;
        }
        if (Math.abs(diffX) > Math.abs(diffY) && diffX > limitX) {
            // Movement is mostly horizontal and beyond limit to the right.
            // Reset trackers. Go to previous image. Return.
            touchStartX = null;
            touchStartY = null;
            goToPrevImage();
            return;
        }
        if (Math.abs(diffX) > Math.abs(diffY) && diffX < -limitX) {
            // Movement is mostly horizontal and beyond limit to the left.
            // Reset trackers. Go to next image. Return.
            touchStartX = null;
            touchStartY = null;
            goToNextImage();
            return;
        }

        // Movement was not beyond limits. Reset styles and trackers.
        resetLightboxForImage(evt.target);
    }

    function handleTouchmove (evt) {
        // If multiple fingers or zoomed or tracker reset...
        if (evt.changedTouches.length !== 1 || window.innerWidth !== window.outerWidth || touchStartX === null) {
            resetLightboxForImage(evt.target);
            return;
        }

        // Prevent scroll of document body.
        evt.preventDefault();
        evt.stopPropagation();

        var diffX = evt.changedTouches[0].clientX - touchStartX;
        var diffY = evt.changedTouches[0].clientY - touchStartY;
        var factor = (window.innerWidth - Math.abs(diffY) / 2) / window.innerWidth;

        if (Math.abs(diffY) > Math.abs(diffX)) {
            // Movement is mostly vertical.
            // Undo possible horizontal style.
            // Shrink image. Move image vertically. Fade curtain.
            lightboxListEl.style.transform = `translateX(-${100 * lightboxIndex}vw)`;
            evt.target.style.transform = `scale(${factor}) translateY(${diffY}px)`;
            lightboxCurtainEl.style.opacity = factor;
        } else {
            // Movement is mostly horizontal.
            // Undo possible vertical styles.
            // Move list horizontally.
            evt.target.style.transform = 'scale(1) translateY(0)';
            lightboxCurtainEl.style.opacity = 1;
            lightboxListEl.style.transform = `translateX(calc(-${100 * lightboxIndex}vw + ${diffX}px))`;
        }
    }

    function handleTouchstart (evt) {
        // If multiple fingers or zoomed...
        if (evt.changedTouches.length !== 1 || window.innerWidth !== window.outerWidth) {
            resetLightboxForImage(evt.target);
            return;
        }
        touchStartX = evt.changedTouches[0].clientX;
        touchStartY = evt.changedTouches[0].clientY;
    }

    function init () {
        getRefs();
        buildImageEls();
        initLightbox();
    }

    function initLightbox () {
        // Add touch listeners.
        lightboxListEl.addEventListener('touchstart', handleTouchstart);
        lightboxListEl.addEventListener('touchmove', handleTouchmove);
        lightboxListEl.addEventListener('touchend', handleTouchend);

        // Add click listeners.
        lightboxButtonExitEl.addEventListener('click', exitLightbox);
        lightboxButtonPrevEl.addEventListener('click', goToPrevImage);
        lightboxButtonNextEl.addEventListener('click', goToNextImage);

        // Add key listeners.
        document.addEventListener('keydown', function (evt) {
            if (evt.key === 'Esc' || evt.key === 'Escape') {
                exitLightbox();
            }
            if (evt.key === 'ArrowLeft') {
                goToPrevImage();
            }
            if (evt.key === 'ArrowRight') {
                goToNextImage();
            }
        });
    }

    function resetLightboxForImage (el) {
        el.style.transform = 'scale(1) translateY(0)';
        lightboxListEl.style.transform = `translateX(-${100 * lightboxIndex}vw)`;
        lightboxCurtainEl.style.opacity = 1;
        touchStartX = null;
        touchStartY = null;
    }

    function shuffle (arr) {
        var ind;
        var len = arr.length;
        var tmp;
        while (len--) {
            ind = Math.floor(len * Math.random());
            tmp = arr[ind];
            arr[ind] = arr[len];
            arr[len] = tmp;
        }
        return arr;
    }

    var rootEl;
    var gridWrapEl;
    var lightboxButtonExitEl;
    var lightboxButtonNextEl;
    var lightboxButtonPrevEl;
    var lightboxCurtainEl;
    var lightboxListEl;
    var lightboxWrapEl;

    var lightboxIndex = 0;
    var touchStartX = null;
    var touchStartY = null;

    var fileNames = [
        // List filenames here as array items.
        '10x8in.jpg',
        '16x9in.jpg',
        '2x3in.jpg',
        '3x2in.jpg',
        '3x4in.jpg',
        '3x5in.jpg',
        '4x3in.jpg',
        '4x6in.jpg',
        '5x3in.jpg',
        '5x7in.jpg',
        '6x4in.jpg',
        '7x5in.jpg',
        '8x10in.jpg',
        '9x16in.jpg',
    ];

    // Display in random order if desired.
    fileNames = shuffle(fileNames);

    if (document.readyState != 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();
