
/**
 * schema node
 */
interface SchemaNode {
  [key: string]: any;
  /**
   * 节点唯一标识，不可重复，插件都是以此id进行节点区分
   */
  id?: string;
  component?: string;
  attributes?: DynamicObject;
  children?: SchemaNode[] | null;
}