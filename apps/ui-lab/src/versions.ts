/**
 * Registered versions are explicit components in the repository.
 * A label alone must never pretend to be a saved snapshot.
 */
export type LabVersion = {id:string;name:string;description:string;previewId:string};
export const labVersions:LabVersion[]=[
{id:"current",name:"Actual · main (vista demo)",description:"Vista del frontend importada desde el commit compilado",previewId:"full-app"},

{id:"knowledge",name:"Conocimiento · vista actual",description:"Vista de Conocimiento del frontend actual; no es un snapshot histórico",previewId:"knowledge"},
];
