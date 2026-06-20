import type { Schema, Struct } from '@strapi/strapi';

export interface SharedFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_feature_items';
  info: {
    description: 'A product feature with optional image';
    displayName: 'FeatureItem';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedImageItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_image_items';
  info: {
    description: 'An image reference with alt text';
    displayName: 'ImageItem';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SharedOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_order_items';
  info: {
    description: 'A single line item in an order';
    displayName: 'OrderItem';
  };
  attributes: {
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SharedSpecItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_spec_items';
  info: {
    description: 'A key-value spec pair or single spec value';
    displayName: 'SpecItem';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.feature-item': SharedFeatureItem;
      'shared.image-item': SharedImageItem;
      'shared.order-item': SharedOrderItem;
      'shared.spec-item': SharedSpecItem;
    }
  }
}
