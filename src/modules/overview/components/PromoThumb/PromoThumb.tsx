import classNames from 'classnames';
import { Img } from 'modules/uiKit/Img';
import Truncate from 'react-truncate';
import { usePromoThumbStyles } from './PromoThumbStyles';

export type PromoThumbProps = {
  className?: string;
  img?: string;
  title: string;
};

export const PromoThumb = ({ img, title, className }: PromoThumbProps) => {
  const classes = usePromoThumbStyles();

  return (
    <div className={classNames(classes.root, className)}>
      <Img src={img} ratio="1x1" className={classes.imgWrap} loading="lazy" />

      <div className={classes.title} title={title}>
        <Truncate lines={3}>{title}</Truncate>
      </div>
    </div>
  );
};