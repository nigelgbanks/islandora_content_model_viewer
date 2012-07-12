<div id="<?php print $wrapper_id; ?>" class="drupal-content">
   <?php switch($action):
case 'edit': ?>
   <?php print drupal_get_form('content_model_viewer_edit_metadata_form', $pid); ?>
   <?php break;?>
   <?php case 'ingest-concept': ?>
   <?php print drupal_get_form('content_model_viewer_ingest_concept_metadata_form', $pid); ?>
   <?php break;?>
   <?php case 'ingest-resource': ?>
   <?php print drupal_get_form('content_model_viewer_ingest_resource_metadata_form', $pid); ?>
   <?php break;?>
   <?php endswitch; ?>
</div>
