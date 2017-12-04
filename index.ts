import Vue from "vue";
import Component from "vue-class-component";
import "file-uploader-vue-component";
import { indexTemplateHtml } from "./variables";

@Component({
    template: indexTemplateHtml,
})
class App extends Vue {
    color = "#ff0000";

    private leftCanvasContext: CanvasRenderingContext2D | null = null;
    private leftWidth = 0;
    private leftHeight = 0;
    private rightCanvasContext: CanvasRenderingContext2D | null = null;
    private rightWidth = 0;
    private rightHeight = 0;

    leftFileGot(file: File | Blob) {
        const reader = new FileReader();
        reader.onload = e => {
            const image = new Image();
            image.onload = () => {
                const canvas = this.$refs.leftCanvas as HTMLCanvasElement;
                this.leftWidth = image.width;
                this.leftHeight = image.height;
                canvas.width = this.leftWidth;
                canvas.height = this.leftHeight;
                this.leftCanvasContext = canvas.getContext("2d")!;
                this.leftCanvasContext.drawImage(image, 0, 0, this.leftWidth, this.leftHeight);
                this.compare();
            };
            image.src = (e.target as FileReader).result;
        };
        reader.readAsDataURL(file);
    }

    rightFileGot(file: File | Blob) {
        const reader = new FileReader();
        reader.onload = e => {
            const image = new Image();
            image.onload = () => {
                const canvas = this.$refs.rightCanvas as HTMLCanvasElement;
                this.rightWidth = image.width;
                this.rightHeight = image.height;
                canvas.width = this.rightWidth;
                canvas.height = this.rightHeight;
                this.rightCanvasContext = canvas.getContext("2d")!;
                this.rightCanvasContext.drawImage(image, 0, 0, this.rightWidth, this.rightHeight);
                this.compare();
            };
            image.src = (e.target as FileReader).result;
        };
        reader.readAsDataURL(file);
    }

    compare() {
        if (this.leftCanvasContext === null || this.rightCanvasContext === null) {
            return;
        }
        const minWidth = Math.min(this.leftWidth, this.rightWidth);
        const minHeight = Math.min(this.leftHeight, this.rightHeight);
        const leftData = this.leftCanvasContext.getImageData(0, 0, minWidth, minHeight).data;
        const rightData = this.rightCanvasContext.getImageData(0, 0, minWidth, minHeight).data;
        const totalPixelCount = 4 * minWidth * minHeight;
        const red = parseInt(this.color.substring(1, 3), 16);
        const blue = parseInt(this.color.substring(3, 5), 16);
        const green = parseInt(this.color.substring(5), 16);
        for (let i = 0; i < totalPixelCount; i += 4) {
            if (leftData[i] !== rightData[i]
                || leftData[i + 1] !== rightData[i + 1]
                || leftData[i + 2] !== rightData[i + 2]
                || leftData[i + 3] !== rightData[i + 3]) {
                rightData[i] = red;
                rightData[i + 1] = blue;
                rightData[i + 2] = green;
            }
        }
        this.rightCanvasContext.putImageData(new ImageData(rightData, minWidth, minHeight), 0, 0);
    }
}

new App({ el: "#container" });
