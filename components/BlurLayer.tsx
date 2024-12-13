import React from "react"

const BlurLayers = () => {
  const computeLayerStyle = (index: number) => {
    const blurAmount = index * 3.7037
    const maskStart = index * 10
    let maskEnd = maskStart + 20
    if (maskEnd > 100) {
      maskEnd = 100
    }
    return {
      backdropFilter: `blur-sm(${blurAmount}px)`,
      WebkitBackdropFilter: `blur-sm(${blurAmount}px)`,
      zIndex: index + 1,
      maskImage: `linear-gradient(rgba(0, 0, 0, 0) ${maskStart}%, rgb(0, 0, 0) ${maskEnd}%)`,
    }
  }

  // 根据层数动态生成层
  const layers = Array.from({ length: 5 }).map((_, index) => (
    <div
      key={index}
      className={"absolute inset-0 h-full w-full"}
      style={computeLayerStyle(index)}
    />
  ))

  return (
    <div className={"fixed bottom-0 left-0 right-0 z-50 h-[140px]"}>
      <div className={"relative h-full"}>{layers}</div>
    </div>
  )
}

export default BlurLayers
