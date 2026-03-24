const bars = Array.from({ length: 8 }, (_, index) => ({
  id: `hamster-bar-${index + 1}`,
}))

export const Loader = ({ visible }: { visible: boolean }) => {
  return (
    <div className="hamster-loading-wrapper" data-visible={visible}>
      <div className="hamster-spinner">
        {bars.map((bar) => (
          <div className="hamster-loading-bar" key={bar.id} />
        ))}
      </div>
    </div>
  )
}
