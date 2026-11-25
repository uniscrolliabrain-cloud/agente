import {asset,labels,kinds,type Kind} from "./model";
export function NodeIcon({kind}:{kind:Kind}){return <span className="ta-icon"><img src={asset(kind)} alt={labels[kinds.indexOf(kind)]}/></span>}
