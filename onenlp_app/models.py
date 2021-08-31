from django.db import models

# Create our models here.
class TimeAuditModel(models.Model):
    """ To path when the record was created and last modified """
    created = models.DateTimeField(auto_now_add=True, verbose_name="Created At",)
    updated = models.DateTimeField(auto_now=True, verbose_name="Last Modified At")

    class Meta:
        abstract = True

class Snippets(TimeAuditModel):
    title = models.CharField(max_length=255, unique=True)
    content = models.TextField(blank=True, default="")
    author = models.CharField(max_length=255, null=True, blank = True)

    class Meta:
        db_table = "snippets"
        ordering = ["-created"]

    def __str__(self):
        return self.title