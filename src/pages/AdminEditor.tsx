import { useParams } from 'react-router-dom';
import { PostEditorForm } from '../features/post-editor/PostEditorForm';

export function AdminEditor() {
  const { id } = useParams<{ id: string }>();
  return <PostEditorForm id={id} />;
}
