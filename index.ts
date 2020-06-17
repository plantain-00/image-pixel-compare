import Vue from 'vue'
import Component from 'vue-class-component'
import 'file-uploader-vue-component'
import { indexTemplateHtml, indexTemplateHtmlStatic } from './variables'

@Component({
  render: indexTemplateHtml,
  staticRenderFns: indexTemplateHtmlStatic
})
export class App extends Vue {
  color = '#ff0000'
  leftFileName = ''
  rightFileName = ''

  get position() {
    if (this.mousePosition.length === 0) {
      return ''
    }
    return `(${this.mousePosition[0]}, ${this.mousePosition[1]})`
  }
  get leftPixelInfo() {
    if (this.leftPixel.length === 0) {
      return ''
    }
    return `${getRgba(this.leftPixel)} ${getHex(this.leftPixel)}`
  }
  get rightPixelInfo() {
    if (this.rightPixel.length === 0) {
      return ''
    }
    return `${getRgba(this.rightPixel)} ${getHex(this.rightPixel)}`
  }

  private leftCanvasContext: CanvasRenderingContext2D | null = null
  private leftImage?: HTMLImageElement
  private leftRawImageData?: ImageData

  private rightCanvasContext: CanvasRenderingContext2D | null = null
  private rightImage?: HTMLImageElement
  private rightRawImageData?: ImageData

  private mousePosition: number[] = []
  private leftPixel: number[] = []
  private rightPixel: number[] = []

  onLeftMouseMove(e: MouseEvent) {
    const canvas = this.$refs.leftCanvas as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    this.mousePosition = [e.clientX - rect.left, e.clientY - rect.top]
    this.updatePixelInfo()
  }

  onRightMouseMove(e: MouseEvent) {
    const canvas = this.$refs.rightCanvas as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    this.mousePosition = [e.clientX - rect.left, e.clientY - rect.top]
    this.updatePixelInfo()
  }

  private updatePixelInfo() {
    if (this.leftRawImageData && this.leftImage) {
      const index = (this.mousePosition[1] * this.leftImage.width + this.mousePosition[0]) * 4
      this.leftPixel = [
        this.leftRawImageData.data[index],
        this.leftRawImageData.data[index + 1],
        this.leftRawImageData.data[index + 2],
        this.leftRawImageData.data[index + 3]
      ]
    }
    if (this.rightRawImageData && this.rightImage) {
      const index = (this.mousePosition[1] * this.rightImage.width + this.mousePosition[0]) * 4
      this.rightPixel = [
        this.rightRawImageData.data[index],
        this.rightRawImageData.data[index + 1],
        this.rightRawImageData.data[index + 2],
        this.rightRawImageData.data[index + 3]
      ]
    }
  }

  leftFileGot(file: File | Blob) {
    const reader = new FileReader()
    reader.onload = e => {
      const image = new Image()
      image.onload = () => {
        const canvas = this.$refs.leftCanvas as HTMLCanvasElement
        this.leftFileName = (file as File).name
        canvas.width = image.width
        canvas.height = image.height
        this.leftImage = image
        this.leftCanvasContext = canvas.getContext('2d')!
        this.leftCanvasContext.drawImage(image, 0, 0, image.width, image.height)
        this.leftRawImageData = this.leftCanvasContext.getImageData(0, 0, image.width, image.height)
        this.compare()
      }
      image.src = (e.target as FileReader).result as string
    }
    reader.readAsDataURL(file)
  }

  rightFileGot(file: File | Blob) {
    const reader = new FileReader()
    reader.onload = e => {
      const image = new Image()
      image.onload = () => {
        const canvas = this.$refs.rightCanvas as HTMLCanvasElement
        this.rightFileName = (file as File).name
        canvas.width = image.width
        canvas.height = image.height
        this.rightImage = image
        this.rightCanvasContext = canvas.getContext('2d')!
        this.rightCanvasContext.drawImage(image, 0, 0, image.width, image.height)
        this.rightRawImageData = this.rightCanvasContext.getImageData(0, 0, image.width, image.height)
        this.compare()
      }
      image.src = (e.target as FileReader).result as string
    }
    reader.readAsDataURL(file)
  }

  compare() {
    if (this.leftCanvasContext === null || this.rightCanvasContext === null || !this.leftImage || !this.rightImage) {
      return
    }
    const minWidth = Math.min(this.leftImage.width, this.rightImage.width)
    const minHeight = Math.min(this.leftImage.height, this.rightImage.height)
    const leftData = this.leftCanvasContext.getImageData(0, 0, minWidth, minHeight).data
    this.rightCanvasContext.drawImage(this.rightImage, 0, 0, this.rightImage.width, this.rightImage.height)
    const rightData = this.rightCanvasContext.getImageData(0, 0, minWidth, minHeight).data
    const totalPixelCount = 4 * minWidth * minHeight
    const red = parseInt(this.color.substring(1, 3), 16)
    const blue = parseInt(this.color.substring(3, 5), 16)
    const green = parseInt(this.color.substring(5), 16)
    for (let i = 0; i < totalPixelCount; i += 4) {
      if (leftData[i] !== rightData[i]
        || leftData[i + 1] !== rightData[i + 1]
        || leftData[i + 2] !== rightData[i + 2]
        || leftData[i + 3] !== rightData[i + 3]) {
        rightData[i] = red
        rightData[i + 1] = blue
        rightData[i + 2] = green
      }
    }
    this.rightCanvasContext.putImageData(new ImageData(rightData, minWidth, minHeight), 0, 0)
  }
}

new App({ el: '#container' })

function formatColor(value: number) {
  const result = value.toString(16)
  return result.length === 2 ? result : '0' + result
}

function getHex(value: number[]) {
  return `#${formatColor(value[0])}${formatColor(value[1])}${formatColor(value[2])}`
}

function getRgba(value: number[]) {
  return `rgba(${value[0]}, ${value[1]}, ${value[2]}, ${value[3]})`
}
