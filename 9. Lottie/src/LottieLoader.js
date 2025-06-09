import {
	FileLoader,
	Loader,
	CanvasTexture,
	LinearFilter,
	SRGBColorSpace
} from 'three';

import lottie from 'lottie-web';

class LottieLoader extends Loader {
	constructor() {
		super();
		this._quality = 1;
		this._isLoop = false;
		this._isAutoplay = false;
		this._frameThrottle = 1;
		this._frameCount = 0;
	}

	setQuality(value) {
		this._quality = value;
		return this;
	}

	setIsLoop(value) {
		this._isLoop = value;
		return this;
	}

	setIsAutoplay(value) {
		this._isAutoplay = value;
		return this;
	}

	setFrameThrottle(value) {
		this._frameThrottle = value;
		return this;
	}

	load(url, onLoad, onProgress, onError) {
		const quality = this._quality || 1;
		const isLoop = this._isLoop;
		const isAutoplay = this._isAutoplay;
		const frameThrottle = this._frameThrottle;

		const loader = new FileLoader(this.manager);
		loader.setPath(this.path);
		loader.setWithCredentials(this.withCredentials);

		loader.load(url, function(text) {
			const data = JSON.parse(text);

			// Create container for Lottie animation
			const container = document.createElement('div');
			container.style.width = data.w + 'px';
			container.style.height = data.h + 'px';
			container.style.position = 'fixed';
			container.style.top = '0';
			container.style.left = '0';
			container.style.zIndex = '-1';
			container.style.visibility = 'visible';
			container.style.opacity = '1';
			document.body.appendChild(container);

			// Initialize Lottie animation with optimized settings
			const animation = lottie.loadAnimation({
				container: container,
				renderer: 'canvas',
				loop: isLoop,
				autoplay: isAutoplay,
				animationData: data,
				rendererSettings: { 
					dpr: quality,
					progressiveLoad: true,
					preserveAspectRatio: 'xMidYMid slice',
					clearCanvas: true,
					className: 'lottie-canvas'
				}
			});

			// Wait for the first frame to be rendered
			animation.addEventListener('DOMLoaded', () => {
				// Create texture from the canvas with optimized settings
				const texture = new CanvasTexture(animation.container);
				texture.minFilter = LinearFilter;
				texture.magFilter = LinearFilter;
				texture.generateMipmaps = false;
				texture.colorSpace = SRGBColorSpace;
				texture.premultiplyAlpha = true;

				// Store animation reference on texture
				texture.animation = animation;
				texture.container = container;

				// Update texture when animation frame changes with throttling
				animation.addEventListener('enterFrame', function() {
					if (frameThrottle <= 1 || this._frameCount++ % frameThrottle === 0) {
						texture.needsUpdate = true;
					}
				}.bind(this));

				// Add play/pause methods to texture
				texture.play = function() {
					animation.play();
				};

				texture.pause = function() {
					animation.pause();
				};

				texture.goToAndPlay = function(frame, isFrame) {
					animation.goToAndPlay(frame, isFrame);
				};

				texture.goToAndStop = function(frame, isFrame) {
					animation.goToAndStop(frame, isFrame);
				};

				// Add cleanup method
				texture.dispose = function() {
					animation.destroy();
					container.remove();
				};

				// Add complete event listener
				animation.addEventListener('complete', function() {
					if (texture.onComplete) {
						texture.onComplete();
					}
				});

				if (onLoad !== undefined) {
					onLoad(texture);
				}
			});
		}, onProgress, onError);
	}
}

export { LottieLoader };
