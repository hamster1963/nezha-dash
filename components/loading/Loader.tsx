const bars = Array(8).fill(0)

export const Loader = ({ visible }: { visible: boolean }) => {
  return (
    <div className="hamster-loading-wrapper" data-visible={visible}>
      <div className="hamster-spinner">
        {bars.map((_, i) => (
          <div className="hamster-loading-bar" key={`hamster-bar-${i}`} />
        ))}
      </div>
    </div>
  )
}
