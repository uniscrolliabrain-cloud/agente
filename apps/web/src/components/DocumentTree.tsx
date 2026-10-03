// E2_DOCUMENT_TREE_V1 - arbol nativo con details/summary.
interface TreeNode {
  id: string;
  name: string;
  kind: "folder" | "file";
  size?: number;
  mimeType?: string;
  children?: TreeNode[];
}

interface Props {
  nodes: TreeNode[];
  onOpen?: (id: string) => void;
}

function formatSize(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentTree({ nodes, onOpen }: Props) {
  return (
    <ul className="dtree" role="tree">
      {nodes.map((n) => (
        <li key={n.id} role="treeitem">
          {n.kind === "folder" ? (
            <details open>
              <summary className="dtree__folder">
                📁 <span>{n.name}</span>
                <small className="dtree__count">{n.children?.length ?? 0}</small>
              </summary>
              {n.children && <DocumentTree nodes={n.children} onOpen={onOpen} />}
            </details>
          ) : (
            <button
              type="button"
              className="dtree__file"
              onClick={() => onOpen?.(n.id)}
            >
              📄 <span className="dtree__name">{n.name}</span>
              {n.size != null && <small className="dtree__size">{formatSize(n.size)}</small>}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}