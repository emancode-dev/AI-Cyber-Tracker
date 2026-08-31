function EmptyState({ title = "Nothing here yet", message = "There is no data to show." }) {
  return <div className="empty-state"><h3>{title}</h3><p>{message}</p></div>;
}
export default EmptyState;
