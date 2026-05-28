import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { WorkflowEditor } from "@/components/builder/workflow-editor";

export default async function ApiWorkflowPage(props: { params: Promise<{ id: string, apiId: string }> }) {
  const { id, apiId } = await props.params;
  const supabase = await createClient();

  const { data: endpoint } = await supabase
    .from('endpoints')
    .select('*')
    .eq('id', apiId)
    .eq('project_id', id)
    .single();

  if (!endpoint) notFound();

  return (
    <div className="h-full w-full relative bg-muted/5">
        <WorkflowEditor
            initialData={endpoint.workflow}
            projectId={id}
            endpointId={apiId}
        />
    </div>
  );
}
