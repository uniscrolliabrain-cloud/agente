/**
 * Registered versions are explicit components in the repository.
 * A label alone must never pretend to be a saved snapshot.
 */
export type LabVersion = {id:string;name:string;description:string;previewId:string};
export const labVersions:LabVersion[]=[
{id:"current",name:"Actual · rama UI Lab",description:"Último componente del código de esta rama",previewId:"full-app"},

{id:"knowledge",name:"Conocimiento · C01",description:"Variante editorial incluida en la rama de origen",previewId:"knowledge"},
];
