(function () {

    // Wait for DOM.
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        jp();
    } else {
        document.addEventListener('DOMContentLoaded', jp);
    }

    function jp () {
        var content = document.getElementById('content');
        content.classList.add('loaded');
    }
})();
