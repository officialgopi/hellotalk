interface TitleProps {
  title?: string;
  description?: string;
}

const Title: React.FC<TitleProps> = ({
  title = "Hellotalk",
  description = "Experience crystal-clear communication pipelines and secure end-to-end messaging environments on Hellotalk.",
}) => {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="application-name" content="Hellotalk" />
      <meta name="apple-mobile-web-app-title" content="Hellotalk" />
    </>
  );
};

export default Title;
