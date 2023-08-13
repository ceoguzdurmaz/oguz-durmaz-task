"use client";
import PageLayout from "@/components/PageLayout";
import { useAppDataContext } from "@/context/store";
import { convertSlugToTitle } from "@/Utils";
import BoxComponent from "@/components/Box";
const PluginsPage = ({
  params,
}: {
  params: {
    slug: string;
  };
}) => {
  const { pluginsData } = useAppDataContext();
  const plugins = pluginsData.filter(
    (plugin) => plugin.category === params.slug
  );
  return (
    <PageLayout slug={params.slug}>
      <div className={"container p-40"}>
        <div className={"row"}>
          <div className={"col-12"}>
            <h1 className={"page-title"}>
              {convertSlugToTitle(params.slug)} Plugins
            </h1>
          </div>
        </div>
        <div className={"row"}>
          <div className={"col-12"}>
            <div className="flex flex-wrap gap-30">
              {plugins.map((plugin, index) => (
                <BoxComponent key={index} plugin={plugin} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PluginsPage;
